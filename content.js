const API_URL = 'https://api.exchangerate-api.com/v4/latest/'; // API untuk mengambil data kurs mata uang

// Fungsi untuk mengubah mata uang
async function convertCurrency(originalAmount, fromCurrency, toCurrency) {
  const response = await fetch(`${API_URL}${fromCurrency}`);
  const data = await response.json();
  const rate = data.rates[toCurrency];
  return originalAmount * rate;
}

// Mendapatkan harga dari halaman
function getPriceElement() {
  // Sesuaikan selector ini berdasarkan website
  return document.querySelector('.product-price');
}

// Update harga dengan mata uang lokal
async function updatePrice() {
  const priceElement = getPriceElement();
  if (priceElement) {
    const priceText = priceElement.innerText;
    const originalPrice = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
    const localCurrency = 'IDR'; // Mata uang lokal pengguna

    const convertedPrice = await convertCurrency(originalPrice, 'USD', localCurrency); // Ubah USD menjadi mata uang lokal
    priceElement.innerText = `Rp ${convertedPrice.toFixed(2)}`; // Ganti harga dengan konversi
  }
}

// Jalankan saat halaman dimuat
updatePrice();
