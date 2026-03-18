import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize PostgreSQL Database Connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g., postgres://user:pass@localhost:5432/telecom_db
});

// 2. Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Define the "Tool" (Function Declaration) for Gemini
// This tells Gemini: "If you need revenue leakage data, ask me to run this function."
const revenueLeakageTool = {
  functionDeclarations: [
    {
      name: "query_revenue_leakage",
      description: "Queries the billing database to find variance between expected and actual revenue, and lists operational root causes.",
      parameters: {
        type: "OBJECT",
        properties: {
          category: { 
            type: "STRING", 
            description: "The fee category to audit, e.g., 'Shipping and Handling', 'Regional Sports Fee'" 
          }
        },
        required: ["category"]
      }
    }
  ]
};

// 4. Create the API Endpoint for the React Frontend
app.post('/api/strategy', async (req, res) => {
  const { prompt, history } = req.body;

  try {
    // Select the model and equip it with our Database Tool
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-pro",
        tools: [revenueLeakageTool] 
    });

    // Start a chat session holding the system instructions
    const chat = model.startChat({
      history: history || [], // Pass the formatted history from React
      systemInstruction: "You are the Strategy Agent. You MUST use the query_revenue_leakage tool to get real financial data. Do not invent numbers. Format your final answer exactly into the UI JSON schema based on the tool's response."
    });

    // Send the user's prompt to Gemini
    let result = await chat.sendMessage(prompt);
    let response = result.response;

    // 5. Intercept the Function Call (The Magic Step)
    // Check if Gemini decided it needs database data to answer the prompt
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === "query_revenue_leakage") {
        const { category } = call.args;
        console.log(`🤖 Gemini requested real DB data for: ${category}`);

        // --- EXECUTE REAL SQL AGAINST YOUR DATABASE ---
        console.log(`🔍 Querying PostgreSQL for category: ${category}`);
        
        // Actually query the database using the pg Pool
        const dbQuery = await pool.query(
          `SELECT expected_revenue, actual_revenue, root_cause, impacted_accounts, monthly_leakage, recovery_effort 
           FROM unbilled_ledger 
           WHERE fee_category = $1`,
          [category]
        );

        const rows = dbQuery.rows;

        // Format the database rows into an object Gemini can easily read
        const dbResponse = {
            expected_revenue: rows.length > 0 ? rows[0].expected_revenue : 0,
            actual_revenue: rows.length > 0 ? rows[0].actual_revenue : 0,
            actual_shortfall: rows.length > 0 ? (rows[0].expected_revenue - rows[0].actual_revenue) : 0,
            root_causes: rows.map(row => ({
                cause: row.root_cause,
                impacted_accounts: row.impacted_accounts,
                monthly_leakage: row.monthly_leakage,
                recovery_effort: row.recovery_effort
            }))
        };

        // 6. Hand the real database data back to Gemini
        console.log("📊 Handing real DB data back to Gemini...");
        result = await chat.sendMessage([{
          functionResponse: {
            name: "query_revenue_leakage",
            response: dbResponse
          }
        }]);
        
        // Gemini now takes this real data and formats it into your beautiful JSON UI Schema!
        response = result.response;
      }
    }

    // 7. Send the final JSON payload back to your React app
    const finalJSONText = response.text();
    res.json({ content: finalJSONText });

  } catch (error) {
    console.error("❌ Middleware Error:", error);
    res.status(500).json({ error: "Failed to generate strategy." });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Strategy Agent Middleware running on http://localhost:${PORT}`);
});