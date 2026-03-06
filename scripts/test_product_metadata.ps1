$headers = @{ "Content-Type" = "application/json" }
$body = @{
  name = "Eco-Friendly Bamboo Toothbrush"
  description = "A biodegradable toothbrush made from sustainably sourced bamboo with charcoal-infused bristles. Plastic-free packaging."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/generate-product-metadata" -Method Post -Headers $headers -Body $body | ConvertTo-Json -Depth 10 -Compress
 
