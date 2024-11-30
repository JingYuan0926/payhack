import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { income, savings } = req.body;

    // Calculate total savings amount
    const totalSavingsAmount = savings.daily_savings.reduce(
      (sum, day) => sum + day.amount, 
      0
    );

    // Randomly select a bank
    const banks = ['Maybank', 'RHB Bank'];
    const selectedBank = banks[Math.floor(Math.random() * banks.length)];

    const prompt = `
      Analyze this financial data and provide a JSON response for investment split:

      Monthly Income Trends:
      ${JSON.stringify(income.monthly_finances, null, 2)}

      Annual Financial Health:
      ${JSON.stringify(income.annual_summary, null, 2)}

      Total Savings Amount: RM ${totalSavingsAmount.toFixed(2)}
      Selected Bank: ${selectedBank}

      Return the investment split in JSON format with bank, percentages, and amounts.
    `;

    console.log('Sending request to OpenAI...'); // Debug log

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor. Return response in JSON format with bank, percentages and amounts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    // Instead of parsing OpenAI response, use our fixed structure
    const formattedAdvice = {
      fixedDeposit: {
        bank: selectedBank,
        percentage: 60,
        amount: Number((totalSavingsAmount * 0.6).toFixed(2))
      },
      savingsAccount: {
        percentage: 40,
        amount: Number((totalSavingsAmount * 0.4).toFixed(2))
      },
      explanation: `${selectedBank} fixed deposit (60%) for stable returns, savings account (40%) for liquidity.`
    };

    console.log('Formatted advice:', formattedAdvice); // Debug log
    return res.status(200).json(formattedAdvice);

  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      error: error.message,
      details: error.response?.data
    });
  }
}