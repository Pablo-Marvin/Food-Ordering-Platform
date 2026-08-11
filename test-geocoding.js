async function test() {
  try {
    const lat = 12.6819; 
    const lng = 80.0425;
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    console.log("Fetching:", url);
    const res = await fetch(url);
    const data = await res.json();
    console.log("Result:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
