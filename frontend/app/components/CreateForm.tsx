import { useState } from 'react';
import { createAppointment, CreateAppointmentData, Service } from '../hooks/useApi';

interface CreateFormProps {
  services: Service[];
  onSuccess: () => void;
}

export default function CreateForm({ services, onSuccess }: CreateFormProps) {
  const [formData, setFormData] = useState<CreateAppointmentData>({
    client_name: '',
    client_email: '',
    date: '',
    time: '',
    service_id: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await createAppointment(formData);
    setLoading(false);
    if (success) {
      setFormData({ client_name: '', client_email: '', date: '', time: '', service_id: '' });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="terminal-prompt">$ new appointment</div>
      <div>
        <label htmlFor="name">name: <span className="text-[#00ffff]">{formData.client_name || '_'}</span></label>
        <input
          id="name"
          className="terminal-input block w-full"
          value={formData.client_name}
          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
          required
          placeholder="Enter name"
        />
      </div>
      <div>
        <label htmlFor="email">email: <span className="text-[#00ffff]">{formData.client_email || '_'}</span></label>
        <input
          id="email"
          type="email"
          className="terminal-input block w-full"
          value={formData.client_email}
          onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
          required
          placeholder="name@example.com"
        />
      </div>
      <div>
        <label htmlFor="date">date (YYYY-MM-DD): <span className="text-[#00ffff]">{formData.date || '_'}</span></label>
        <input
          id="date"
          type="date"
          className="terminal-input block w-full"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="time">time (HH:MM): <span className="text-[#00ffff]">{formData.time || '_'}</span></label>
        <input
          id="time"
          type="time"
          className="terminal-input block w-full"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="service">service:</label>
        <select
          id="service"
          className="terminal-input block w-full"
          value={formData.service_id}
          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
          required
        >
          <option value="">Select service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes}m)</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? <span className="blink">█▀█</span> : '[CREATE]'}
      </button>
    </form>
  );
}

