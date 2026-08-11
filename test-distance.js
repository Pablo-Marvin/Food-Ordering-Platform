async function test() {
  try {
    console.log("Sending request to /api/orders/distance/calculate...");
    const res = await fetch('http://localhost:5000/api/orders/distance/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lat: 12.69,
        lng: 80.05
      })
    });
    const text = await res.text();
    console.log("Response:", text);
    console.log("Status:", res.status);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
