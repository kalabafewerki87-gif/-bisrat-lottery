export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, phone, ticketPrice, txRef, returnUrl } = req.body;

 
  const CHAPA_SECRET_KEY = "CHAPA_TEST_PRIV_Yws_wiAoEV7rpa3deMRctqMgN678UyPTvC0jjM4L";

  const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
  const email = "customer" + (cleanPhone || Date.now()) + "@gmail.com";
  const nameParts = (fullName || "Customer User").trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "User";

  try {
    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: ticketPrice.toString(),
        currency: "ETB",
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: cleanPhone,
        tx_ref: txRef,
        callback_url: returnUrl,
        return_url: returnUrl,
        "customization[title]": "ብስራት ኦንላይን ዕጻ",
        "customization[description]": "ናይ መኪና ዕጻ ትኬት ክፍሊት"
      })
    });

    const data = await chapaRes.json();

    if (data.status === "success" && data.data && data.data.checkout_url) {
      return res.status(200).json({ checkout_url: data.data.checkout_url });
    } else {
      return res.status(400).json({ message: data.message || "Failed to initialize payment" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
