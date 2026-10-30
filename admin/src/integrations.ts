import type { RecordData } from './modules';
export function integrationState(item: RecordData): {
    status: string;
    message: string;
} {
    if (['CONNECTED', 'SIMULATED', 'NOT_CONFIGURED', 'ERROR'].includes(item.status))
        return { status: item.status, message: item.message || 'Status reported by the shared application service.' };
    const mode = String(item.mode || '').toLowerCase();
    if (mode === 'simulated')
        return { status: 'SIMULATED', message: 'Test provider only. No live production service is connected.' };
    if (mode === 'native' || mode === 'native-address-registry')
        return { status: 'CONNECTED', message: 'Native address registry. Location eligibility is managed by authorized staff.' };
    if (mode === 'manual')
        return { status: 'MANUAL', message: 'Manual staff workflow is available. An external automated provider is not configured.' };
    if (mode === 'disabled')return {status:'DISABLED',message:'This provider is disabled. No message delivery or external operation is claimed.'};
    if (mode === 'not-connected')
        return { status: 'NOT_CONFIGURED', message: 'An external provider is not configured.' };
    if (mode === 'guidance-only-no-model')
        return { status: 'NOT_CONFIGURED', message: 'Read-only guidance is available. No autonomous agent or model service is connected.' };
    if (mode === 'error')
        return { status: 'ERROR', message: 'The service reported an integration error.' };
    return { status: 'UNKNOWN', message: 'The backend did not report a recognized connection state.' };
}
