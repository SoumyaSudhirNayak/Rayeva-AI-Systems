$headers = @{ "Content-Type" = "application/json" }
$body = @{
  budget = 5000
  purpose = "Office Supplies for Q3"
  quantity = 200
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/generate-b2b-proposal" -Method Post -Headers $headers -Body $body | ConvertTo-Json -Depth 10 -Compress
