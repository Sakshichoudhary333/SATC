export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

export const statusColor = (status) => {
  const map = {
    pending: '#f59e0b',
    assigned: '#3b82f6',
    'in-transit': '#8b5cf6',
    completed: '#10b981',
    started: '#3b82f6',
  };
  return map[status] || '#6b7280';
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const scrollToElementById = (elementId, behavior = 'smooth') => {
  if (typeof document === 'undefined' || !elementId) return false;

  const cleanId = String(elementId).replace(/^#\/?/, '');
  const element = document.getElementById(cleanId);
  if (!element) return false;

  element.scrollIntoView({ behavior, block: 'start' });
  return true;
};
