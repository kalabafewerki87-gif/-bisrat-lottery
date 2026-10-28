export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, phone, ticketPrice, txRef, returnUrl } = req.body;


  const CHAPA_SECRET_KEY = "CHAPA_TEST_PRIV_Yws_wiAoEV7rpa3deMRctqMgN678UyPTvC0jjM4L".trim();

  const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "251" + cleanPhone.slice(1) : (cleanPhone.startsWith("251") ? cleanPhone : "251" + cleanPhone);
  const email = "customer" + (cleanPhone || Date.now()) + "@gmail.com";
  
  const nameParts = (fullName || "Customer User").trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "User";

  // Chapa v2 reference (max 20 chars)
  const shortRef = "BIS-" + Date.now().toString().slice(-10);

  try {
    // 🚀 ወግዓዊ ናይ Chapa v2 Hosted Checkout Endpoint!
    const chapaRes = await fetch("https://api.chapa.global/v2/payments/hosted", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + CHAPA_SECRET_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(Number(ticketPrice) * 100), // v2 ብሳንቲም ይቕበል (1000 ETB = 100000)
        currency: "ETB",
        merchant_reference: shortRef,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: formattedPhone
        },
        return_url: returnUrl,
        customization: {
          title: "ብስራት ኦንላይን ዕጻ",
          description: "ናይ መኪና ዕጻ ትኬት ክፍሊት"
        }
      })
    });

    const data = await chapaRes.json();
    console.log("Chapa v2 Response:", data);

    const checkoutUrl = data.checkout_url || (data.data && data.data.checkout_url);

    if (checkoutUrl) {
      return res.status(200).json({ checkout_url: checkoutUrl });
    } else {
      return res.status(400).json({ message: data.message || "Failed to initialize payment", details: data });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
