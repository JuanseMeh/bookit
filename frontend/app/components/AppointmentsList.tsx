import { Appointment } from '../hooks/useApi';

interface AppointmentsListProps {
  appointments: Appointment[];
  filterStatus: 'ALL' | 'PENDING' | 'DONE' | 'CANCELLED';
  onFilterChange: (status: 'ALL' | 'PENDING' | 'DONE' | 'CANCELLED') => void;
  onUpdateStatus: (id: string, status: 'DONE' | 'CANCELLED') => void;
  onDelete: (id: string) => void;
}

export default function AppointmentsList({ 
  appointments, 
  filterStatus, 
  onFilterChange, 
  onUpdateStatus, 
  onDelete 
}: AppointmentsListProps) {
  const filteredAppointments = appointments.filter((app) =>
    filterStatus === 'ALL' || app.status === filterStatus
  );

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div className="terminal-prompt">$ ls appointments</div>
        <select 
          value={filterStatus} 
          onChange={(e) => onFilterChange(e.target.value as any)} 
          className="ml-auto px-2 py-1 border border-[#00aa00] bg-[#001100] text-[#00ff00]"
        >
          <option>ALL</option>
          <option>PENDING</option>
          <option>DONE</option>
          <option>CANCELLED</option>
        </select>
      </div>
      <table className="terminal-table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Date/Time</th>
            <th>Service ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((app) => (
            <tr key={app.id}>
              <td>{app.id.slice(0, 8)}...</td>
              <td>{app.client_name} ({app.client_email})</td>
              <td>{app.date} {app.time}</td>
              <td>{app.service_id.slice(0, 8)}...</td>
              <td className={app.status === 'PENDING' ? '' : app.status === 'DONE' ? 'text-[#00ff00]' : 'text-[#ff0000]'}>
                {app.status}
              </td>
              <td>
                {app.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <button className="btn" onClick={() => onUpdateStatus(app.id, 'DONE')}>
                      [DONE]
                    </button>
                    <button 
                      className="btn bg-[#ff0000] hover:bg-[#aa0000] border-[#ff0000]" 
                      onClick={() => onDelete(app.id)}
                    >
                      [CANCEL]
                    </button>
                  </div>
                )}
                {app.status !== 'PENDING' && <span>-</span>}
              </td>
            </tr>
          ))}
          {filteredAppointments.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">No appointments</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

