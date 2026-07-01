const LEADS_STORAGE_KEY = 'nortis_leads';

export const saveLead = (leadData) => {
  try {
    const leads = getLeads();
    const newLead = {
      ...leadData,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    leads.push(newLead);
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    
    return { success: true, lead: newLead };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error: error.message };
  }
};

export const getLeads = () => {
  try {
    const leadsJson = localStorage.getItem(LEADS_STORAGE_KEY);
    return leadsJson ? JSON.parse(leadsJson) : [];
  } catch (error) {
    console.error('Error getting leads:', error);
    return [];
  }
};

export const sendConfirmationEmail = async (email, name) => {
  // Simulate email sending - ready for backend integration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: `E-mail de confirmação enviado para ${email}` 
      });
    }, 500);
  });
};

export const validateLeadForm = (name, email) => {
  const errors = {};
  
  if (!name || name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'E-mail inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};