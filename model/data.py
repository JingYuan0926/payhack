import pandas as pd
import numpy as np
from numpy.random import normal, choice
import random

# Set random seed for reproducibility
np.random.seed(42)

# Number of rows
n_rows = 10000

# Generate data
def generate_savings_dataset():
    # Industries with weights (some industries might have higher representation)
    industries = ['Technology', 'Education', 'Healthcare', 'Finance', 'Manufacturing', 
                 'Retail', 'Government', 'Construction', 'Services', 'Energy']
    industry_weights = [0.15, 0.1, 0.12, 0.13, 0.12, 0.1, 0.08, 0.07, 0.08, 0.05]

    # Generate base data
    data = {
        'user_id': range(1, n_rows + 1),
        'monthly_income': normal(5000, 1500, n_rows).clip(2500, 15000),  # RM2.5k - RM15k
        'age': normal(35, 8, n_rows).clip(23, 60).astype(int),  # Working age population
        'risk_tolerance': normal(5.5, 1.5, n_rows).clip(1, 10),  # 1-10 scale
        'job_industry': choice(industries, n_rows, p=industry_weights),
        'dependent_count': choice(range(5), n_rows, p=[0.3, 0.25, 0.25, 0.15, 0.05])  # 0-4 dependents
    }

    df = pd.DataFrame(data)

    # Calculate derived fields
    df['monthly_expenses'] = (df['monthly_income'] * 
                            normal(0.65, 0.1, n_rows).clip(0.4, 0.85) * 
                            (1 + df['dependent_count'] * 0.1))  # Expenses increase with dependents
    
    df['emergency_fund_ratio'] = normal(0.4, 0.15, n_rows).clip(0.1, 0.8)
    df['spending_volatility'] = normal(0.2, 0.05, n_rows).clip(0.1, 0.4)
    
    # Income stability higher for government, finance, healthcare
    df['income_stability'] = normal(0.85, 0.1, n_rows).clip(0.6, 0.95)
    df.loc[df['job_industry'].isin(['Government', 'Finance', 'Healthcare']), 'income_stability'] += 0.1
    df['income_stability'] = df['income_stability'].clip(0, 1)

    # Savings goal timeline (months) - influenced by age and income
    df['savings_goal_timeline'] = normal(24, 8, n_rows).clip(6, 48).astype(int)
    
    # Fixed rates
    df['fixed_deposit_rate'] = normal(2.8, 0.2, n_rows).clip(2.3, 3.3)
    df['savings_account_rate'] = normal(0.5, 0.1, n_rows).clip(0.3, 0.7)
    
    # Debt to income ratio - influenced by age and dependents
    df['debt_to_income_ratio'] = normal(0.3, 0.1, n_rows).clip(0, 0.6)
    df.loc[df['age'] < 30, 'debt_to_income_ratio'] *= 0.8  # Younger people tend to have less debt
    
    # Calculate allocation percentages based on features
    # Higher risk tolerance and longer timeline favor more FD allocation
    base_fd_allocation = (
        df['risk_tolerance'] / 10 * 0.3 +  # Risk tolerance contribution
        df['income_stability'] * 0.3 +     # Income stability contribution
        (df['savings_goal_timeline'] / 48) * 0.2 +  # Timeline contribution
        (1 - df['spending_volatility']) * 0.2   # Spending volatility contribution
    )
    
    # Adjust based on emergency fund ratio
    df['fixed_deposit_allocation_percentage'] = (base_fd_allocation * 100).clip(30, 80).round()
    df['savings_account_allocation_percentage'] = 100 - df['fixed_deposit_allocation_percentage']
    
    # Round numeric columns to 2 decimal places
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    df[numeric_columns] = df[numeric_columns].round(2)
    
    return df

# Generate dataset
df = generate_savings_dataset()

# Save to CSV
df.to_csv('data/savings_allocation.csv', index=False)

# Display first few rows and basic statistics
print("\nFirst few rows:")
print(df.head())
print("\nDataset Statistics:")
print(df.describe())