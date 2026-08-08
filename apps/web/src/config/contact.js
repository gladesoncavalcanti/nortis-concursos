// Contato oficial da Nortis Concursos — configuração centralizada.
//
// Único número de WhatsApp autorizado do site. Antes desta configuração,
// o número aparecia hardcoded em vários arquivos e um deles (o botão
// flutuante) usava um número divergente por engano. Qualquer novo uso de
// WhatsApp no site deve importar destas constantes, nunca hardcodar o
// número novamente.
export const NORTIS_WHATSAPP_DISPLAY = '+55 61 99168-9857';
export const NORTIS_WHATSAPP_NUMBER = '5561991689857';
export const NORTIS_WHATSAPP_MESSAGE =
  'Olá, Nortis Concursos. Tenho uma dúvida sobre a apostila Nexo Social SEDES-DF 2026.';
export const NORTIS_WHATSAPP_URL = `https://wa.me/${NORTIS_WHATSAPP_NUMBER}?text=${encodeURIComponent(NORTIS_WHATSAPP_MESSAGE)}`;
export const NORTIS_SUPPORT_LABEL = 'Suporte pelos canais oficiais';
