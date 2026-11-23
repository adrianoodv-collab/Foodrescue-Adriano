const donationColumns = 'id, tipo_comida, porciones, limite_recoleccion, ubicacion, estado, creado_en';

export function validateDonation(values, now = Date.now()) {
  const errors = {};
  const portions = Number(values.portions);
  const deadline = Date.parse(values.pickupDeadline);
  if (!values.food.trim()) errors.food = 'Describe la comida disponible.';
  if (!Number.isInteger(portions) || portions < 1 || portions > 2147483647) {
    errors.portions = 'Ingresa un número entero de porciones entre 1 y 2147483647.';
  }
  if (!Number.isFinite(deadline) || deadline <= now) {
    errors.pickupDeadline = 'Selecciona una fecha y hora futuras.';
  }
  if (!values.pickupLocation.trim()) errors.pickupLocation = 'Indica el punto de recolección.';
  return errors;
}

export async function loadDonations(client, userId) {
  const { data, error } = await client.from('donaciones')
    .select(donationColumns)
    .eq('restaurante_id', userId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveDonation(client, values) {
  const { data, error } = await client.from('donaciones').insert({
    tipo_comida: values.food.trim(),
    porciones: Number(values.portions),
    limite_recoleccion: new Date(values.pickupDeadline).toISOString(),
    ubicacion: values.pickupLocation.trim(),
  }).select(donationColumns).single();
  if (error) throw error;
  return data;
}
