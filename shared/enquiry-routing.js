export function enquiryCategory(formKind, details='') {
  const direct={installation:'INSTALLATION',quote:'QUOTATION',verification:'ADDRESS_VERIFICATION',fault:'FAULT',service:'SERVICE',support:'SUPPORT',feedback:'FEEDBACK'};
  if(direct[formKind])return direct[formKind];
  if(/fault|connection problem|no internet|slow connection/i.test(details))return 'FAULT';
  if(/coverage|address review|availability|feasibility/i.test(details))return 'COVERAGE';
  if(/installation/i.test(details))return 'INSTALLATION';
  if(/quote/i.test(details))return 'QUOTATION';
  if(/support|complaint|technical/i.test(details))return 'SUPPORT';
  if(/business/i.test(details))return 'BUSINESS';
  if(/residential/i.test(details))return 'RESIDENTIAL';
  return 'GENERAL';
}
