#!/usr/bin/env node
/**
 * Test Ollama connectivity and model availability
 */

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

async function testOllama() {
  console.log("🧪 Testing Ollama connection...\n");
  
  try {
    // Test 1: List models
    console.log("1. Checking available models...");
    const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`);
    const tags = await tagsRes.json();
    console.log(`   ✓ Found ${tags.models?.length || 0} models`);
    
    const recommended = [
      "gemma4:e4b",
      "qwen2.5-coder:7b", 
      "qwen3.5:latest",
      "deepseek-v4-pro:cloud"
    ];
    
    console.log("\n   Recommended models:");
    for (const model of recommended) {
      const found = tags.models?.find(m => m.name === model);
      console.log(`   ${found ? "✓" : "✗"} ${model}`);
    }
    
    // Test 2: Quick generation
    console.log("\n2. Testing generation with gemma4:e4b...");
    const genRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma4:e4b",
        prompt: "Write a Python function to calculate fibonacci. Return only the code.",
        stream: false
      })
    });
    
    const result = await genRes.json();
    
    if (result.response) {
      console.log("   ✓ Model responded!");
      console.log("\n   Response preview:");
      console.log("   " + result.response.slice(0, 200).replace(/\n/g, "\n   "));
      if (result.response.length > 200) {
        console.log("   ... (truncated)");
      }
      console.log("\n   Stats:");
      console.log(`   - Total duration: ${(result.total_duration / 1e9).toFixed(2)}s`);
      console.log(`   - Load duration: ${(result.load_duration / 1e9).toFixed(2)}s`);
      console.log(`   - Eval count: ${result.eval_count} tokens`);
    } else {
      console.log("   ✗ No response from model");
      console.log("   Error:", result.error || "Unknown error");
    }
    
    console.log("\n✅ Ollama is ready for Cursor!");
    console.log("\nNext steps:");
    console.log("1. Open Cursor");
    console.log("2. Go to Settings > AI > Model Providers");
    console.log("3. Add Ollama provider with URL: http://localhost:11434");
    console.log("4. Select a model (try gemma4:e4b first)");
    console.log("5. Test with: 'Write a Python fibonacci function'");
    
  } catch (error) {
    console.error("\n❌ Error connecting to Ollama:");
    console.error(error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Start Ollama: ollama serve");
    console.log("2. Check it's running: curl http://localhost:11434/api/tags");
    console.log("3. Verify models: ollama list");
  }
}

testOllama();
