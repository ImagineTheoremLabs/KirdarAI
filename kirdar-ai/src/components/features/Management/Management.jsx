import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  BookOpen, 
  Activity,
  Key,
  Target,
  Shield,
  Home,
  FileText,
  Banknote,
  HeartPulse,
  Grid
} from 'lucide-react';
import TrainingCodeManager from './TrainingCodeManager';
import UserManagementView from '../UserManagement/UserManagementView';
import GuestCodeManager from '../Guest/GuestCodeManager';
import { useAuth } from '../../../contexts/AuthContext';

const ManagementCard = ({ icon: Icon, title, description, onClick, isActive, badge }) => (
  <div 
    onClick={onClick}
    className={`bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-sky-900/50 transition-all duration-300 cursor-pointer group ${
      isActive ? 'border-sky-500' : ''
    }`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-sky-900/20 rounded-lg group-hover:bg-sky-900/30 transition-colors">
        <Icon className="w-6 h-6 text-sky-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-sky-400">{title}</h2>
          {badge && (
            <span className={`px-2 py-1 rounded-full text-xs ${
              typeof badge === 'number' && badge > 0
                ? 'bg-sky-900/50 text-sky-400'
                : 'bg-gray-800 text-gray-400'
            }`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  </div>
);

const Management = () => {
  const [activeView, setActiveView] = useState('overview');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagementView />;
      case 'codes':
        return <TrainingCodeManager />;
      case 'guest':
        return <GuestCodeManager />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management */}
            <ManagementCard 
              icon={Users}
              title="User Management"
              description="Manage user accounts, roles, and permissions"
              onClick={() => setActiveView('users')}
              badge={20}
            />

            {/* Content Management */}
            <ManagementCard
              icon={BookOpen}
              title="Content Management"
              description="Manage scenarios, personas, and educational content"
              onClick={() => setActiveView('content')}
              badge={15}
            />

            {/* Training Codes */}
            <ManagementCard
              icon={Key}
              title="Training Codes"
              description="Generate and manage training access codes"
              onClick={() => setActiveView('codes')}
              badge={5}
            />

            {/* Guest Access */}
            <ManagementCard
              icon={Key}
              title="Guest Access"
              description="Manage guest access codes and permissions"
              onClick={() => setActiveView('guest')}
              badge={3}
            />

            {/* Analytics */}
            <ManagementCard
              icon={Activity}
              title="Analytics"
              description="View system analytics and user engagement metrics"
              onClick={() => setActiveView('analytics')}
            />

            {/* System Settings */}
            <ManagementCard
              icon={Settings}
              title="Settings"
              description="Configure system settings and preferences"
              onClick={() => setActiveView('settings')}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Grid className="w-8 h-8 text-sky-400" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              Admin Management
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Manage users, content, and system settings
          </p>
        </div>

        {/* Content Area */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Management;