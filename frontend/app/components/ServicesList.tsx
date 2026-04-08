import { Service } from '../hooks/useApi';

interface ServicesListProps {
  services: Service[];
}

export default function ServicesList({ services }: ServicesListProps) {
  return (
    <div>
      <div className="terminal-prompt mb-2">$ ls services</div>
      <table className="terminal-table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Desc</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td>{s.id.slice(0, 8)}...</td>
              <td>{s.name}</td>
              <td>{s.description}</td>
              <td>{s.duration_minutes}m</td>
            </tr>
          ))}
          {services.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center">No services</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

