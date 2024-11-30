import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import json
import os

# Load the dataset
df = pd.read_csv('data/savings_allocation.csv')

# Separate features and target
X = df.drop(['fixed_deposit_allocation_percentage', 'savings_account_allocation_percentage'], axis=1)
y = df['fixed_deposit_allocation_percentage']

# Separate categorical and numerical columns
categorical_features = ['job_industry']
numerical_features = [col for col in X.columns if col not in categorical_features + ['user_id']]

# Create preprocessing pipelines
numeric_transformer = Pipeline(steps=[
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('onehot', OneHotEncoder(drop='first', sparse_output=False))
])

# Combine preprocessing steps
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the model
model = GradientBoostingRegressor(random_state=42)

# Define parameter grid
param_grid = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.01, 0.1],
    'max_depth': [3, 5, 7]
}

# Create pipeline
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', model)
])

# Grid search
grid_search = GridSearchCV(
    pipeline,
    {f'regressor__{key}': value for key, value in param_grid.items()},
    cv=5,
    scoring='r2',
    n_jobs=-1
)

# Fit and evaluate
grid_search.fit(X_train, y_train)
y_pred = grid_search.predict(X_test)

# Calculate metrics
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\nModel Performance Metrics:")
print(f"MAE: {mae:.4f}")
print(f"MSE: {mse:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"R2 Score: {r2:.4f}")
print("\nBest parameters:", grid_search.best_params_)

# Get feature names after preprocessing
feature_names = (numerical_features + 
                [f"{feat}_{val}" for feat, vals in 
                 zip(categorical_features, 
                     grid_search.best_estimator_.named_steps['preprocessor']
                     .named_transformers_['cat']
                     .named_steps['onehot']
                     .categories_) 
                 for val in vals[1:]])

# Get feature importance
feature_importance = dict(zip(
    feature_names,
    grid_search.best_estimator_.named_steps['regressor'].feature_importances_.tolist()
))

# Create model JSON
model_json = {
    'model_type': 'gradient_boosting',
    'parameters': {
        key.replace('regressor__', ''): float(value) if isinstance(value, (np.float32, np.float64)) else value
        for key, value in grid_search.best_params_.items()
    },
    'feature_importance': {
        key: float(value) for key, value in feature_importance.items()
    },
    'features': {
        'numerical': numerical_features,
        'categorical': categorical_features
    },
    'preprocessing': {
        'numerical': 'standard_scaler',
        'categorical': 'onehot_encoder'
    },
    'performance_metrics': {
        'mae': float(mae),
        'mse': float(mse),
        'rmse': float(rmse),
        'r2': float(r2)
    },
    'trees': []
}

# Extract and save tree structure
best_model = grid_search.best_estimator_.named_steps['regressor']
for i, tree in enumerate(best_model.estimators_):
    tree_dict = {
        'tree_index': i,
        'n_nodes': int(tree[0].tree_.node_count),
        'nodes': []
    }
    
    for node_id in range(tree[0].tree_.node_count):
        node = {
            'node_id': int(node_id),
            'feature': int(tree[0].tree_.feature[node_id]) if tree[0].tree_.feature[node_id] >= 0 else 'leaf',
            'threshold': float(tree[0].tree_.threshold[node_id]) if tree[0].tree_.feature[node_id] >= 0 else None,
            'value': float(tree[0].tree_.value[node_id][0][0]),
            'left_child': int(tree[0].tree_.children_left[node_id]) if tree[0].tree_.children_left[node_id] >= 0 else None,
            'right_child': int(tree[0].tree_.children_right[node_id]) if tree[0].tree_.children_right[node_id] >= 0 else None
        }
        tree_dict['nodes'].append(node)
    
    model_json['trees'].append(tree_dict)

# Create model directory if it doesn't exist
os.makedirs('model', exist_ok=True)

# Save model as JSON
with open('model/savings_allocation_model.json', 'w') as f:
    json.dump(model_json, f, indent=4)

print("\nModel saved as JSON with complete tree structure")

# Example prediction
print("\nExample prediction:")
sample_user = X_test.iloc[0]
print("Sample user data:", sample_user.to_dict())
prediction = grid_search.predict([sample_user])[0]
print("Predicted allocation:", {
    'fixed_deposit_allocation': round(prediction, 2),
    'savings_account_allocation': round(100 - prediction, 2)
})