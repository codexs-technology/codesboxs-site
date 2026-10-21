const response = await fetch('https://open.er-api.com/v6/latest/USD', {signal:AbortSignal.timeout(10000)});
if(!response.ok) throw new Error(`Provider HTTP ${response.status}`);
const data=await response.json();
console.log(JSON.stringify({result:data.result,timestamp:data.time_last_update_unix,base:data.base_code,currencies:['USD','PKR','EUR','GBP','AED','SAR','CAD','AUD'].map(currency=>({currency,present:typeof data.rates[currency]==='number'}))},null,2));