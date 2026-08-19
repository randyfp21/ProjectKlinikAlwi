/**
 * Helper function to format any date string or Date object to "10 January 2026" (dd Mmmm yyyy)
 */
export const formatDateIndonesian = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '-';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    // If it's already a formatted date string like '2026-08-19'
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const parts = dateInput.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${day} ${months[monthIndex]} ${year}`;
        }
      }
    }
    return String(dateInput);
  }

  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Helper function to format date with time if needed
 */
export const formatDateTimeIndonesian = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '-';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return formatDateIndonesian(dateInput);

  const dateStr = formatDateIndonesian(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${dateStr}, ${hours}:${minutes} WIB`;
};
