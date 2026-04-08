'use client';

import { useState } from 'react';
import TabNav from './components/TabNav';
import ServicesList from './components/ServicesList';
import CreateForm from './components/CreateForm';
import AppointmentsList from './components/AppointmentsList';
import ErrorMessage from './ErrorMessage';
import { useServices, useAppointments } from './hooks/useApi';

type Tab = 'services' | 'create' | 'list';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'DONE' | 'CANCELLED'>('ALL');
  const [globalError, setGlobalError] = useState('');

  const servicesHook = useServices();
  const appointmentsHook = useAppointments();

  const handleTabChange = (tab: Tab) => setActiveTab(tab);

  const handleFilterChange = (status: 'ALL' | 'PENDING' | 'DONE' | 'CANCELLED') => setFilterStatus(status);

  const handleCreateSuccess = () => {
    appointmentsHook.refetch();
  };

  const handleUpdateStatus = (id: string, status: 'DONE' | 'CANCELLED') => {
    appointmentsHook.updateAppointment(id, status);
  };

  const handleDelete = (id: string) => {
    appointmentsHook.deleteAppointment(id);
  };

  const showError = (error: string) => setGlobalError(error);
  const clearError = () => setGlobalError('');

  return (
    <main className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl">$ bookit terminal {'>'} </h1>
        {globalError && <ErrorMessage message={globalError} />}
      </div>

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'services' && (
        <ServicesList services={servicesHook.services} />
      )}

      {activeTab === 'create' && (
        <CreateForm services={servicesHook.services} onSuccess={handleCreateSuccess} />
      )}

      {activeTab === 'list' && (
        <AppointmentsList
          appointments={appointmentsHook.appointments}
          filterStatus={filterStatus}
          onFilterChange={handleFilterChange}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}

