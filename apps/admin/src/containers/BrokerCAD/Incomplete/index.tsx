import { ClientSelect } from '../Clients/ClientSelect';
import { fetchIncomplete } from './data';

export const Incomplete = () => <ClientSelect fetchData={fetchIncomplete} />
