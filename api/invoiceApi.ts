export async function extractInvoice(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  // Get the backend URL from environment variable
  const BACKEND_URL = import.meta.env.VITE_INVOICE_API_URL || 'https://69e1eaa2559d.ngrok-free.app';

  const response = await fetch(
    `${BACKEND_URL}/extract`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Invoice extraction failed');
  }

  return response.json();
}
