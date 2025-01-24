// src/components/features/Management/UserManagementView.jsx
import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Activity,
  Target,
  Users,
  Loader,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  XCircle,
  BookOpen,
  Award
} from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import { useAuth } from '../../../contexts/AuthContext';

const ScenarioCheckbox = ({ scenario, isAssigned, onToggle }) => (
  <label 
    className={`flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
      isAssigned ? 'border border-sky-500/50' : ''
    }`}
  >
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={isAssigned}
        onChange={(e) => onToggle(scenario._id, e.target.checked)}
        className="hidden"
      />
      <div className={`w-5 h-5 rounded flex items-center justify-center ${
        isAssigned 
          ? 'bg-sky-500 text-white' 
          : 'bg-gray-700 border border-gray-600'
      }`}>
        {isAssigned && <CheckCircle className="w-4 h-4" />}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-medium">{scenario.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          scenario.difficulty === 'Expert' 
            ? 'bg-red-900/50 text-red-400'
            : scenario.difficulty === 'Advanced'
            ? 'bg-orange-900/50 text-orange-400'
            : 'bg-yellow-900/50 text-yellow-400'
        }`}>
          {scenario.difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-400 mt-1">{scenario.description}</p>
      <div className="flex items-center gap-4 mt-2 text-sm">
        <span className="text-sky-400">{scenario.category}</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">{scenario.estimatedTime}</span>
      </div>
    </div>
  </label>
);

const PersonaCheckbox = ({ persona, isAssigned, onChange }) => (
  <label 
    key={persona._id}
    className={`flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
      isAssigned ? 'border border-emerald-500/50' : ''
    }`}
  >
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={isAssigned}
        onChange={(e) => onChange(persona._id, e.target.checked)}
        className="hidden" // Hide actual checkbox
      />
      <div className={`w-5 h-5 rounded flex items-center justify-center ${
        isAssigned 
          ? 'bg-emerald-500 text-white' 
          : 'bg-gray-700 border border-gray-600'
      }`}>
        {isAssigned && <CheckCircle className="w-4 h-4" />}
      </div>
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{persona.name}</p>
      <p className="text-sm text-gray-400 mt-1">{persona.goals}</p>
    </div>
  </label>
);

const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [availablePersonas, setAvailablePersonas] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { user } = useAuth();
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personas');


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAssignModalOpen && selectedUser) {
      if (activeTab === 'personas') {
        fetchAvailablePersonas();
      } else {
        fetchScenarios();
      }
    }
  }, [isAssignModalOpen, selectedUser, activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/trainees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScenarios = async () => {
    try {
      if (!selectedUser) return;
      
      const token = localStorage.getItem('token');
      
      // Fetch all scenarios
      const scenariosResponse = await fetch('http://localhost:5001/api/scenarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!scenariosResponse.ok) throw new Error('Failed to fetch scenarios');
      const allScenarios = await scenariosResponse.json();
      setScenarios(allScenarios);

      // Fetch current assignments
      const assignmentsResponse = await fetch(
        `http://localhost:5001/api/scenario-assignments/user/${selectedUser._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json();
        const assignedIds = assignments.map(a => a.scenarioId._id || a.scenarioId);
        setCurrentAssignments(assignments);
        setSelectedScenarios(assignedIds);
      }
    } catch (err) {
      setError('Failed to load scenarios');
      console.error(err);
    }
  };

  // In src/components/features/Management/UserManagementView.jsx
  const fetchAvailablePersonas = async () => {
    try {
      if (!selectedUser) return;
      
      const token = localStorage.getItem('token');
      
      // Fetch all personas
      const allPersonasResponse = await fetch('http://localhost:5001/api/personas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!allPersonasResponse.ok) throw new Error('Failed to fetch personas');
      const allPersonas = await allPersonasResponse.json();
      setAvailablePersonas(allPersonas);

      // Fetch current assignments
      const assignmentsResponse = await fetch(
        `http://localhost:5001/api/persona-assignments/user/${selectedUser._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json();
        const assignedIds = assignments.map(a => a.personaId._id || a.personaId);
        setCurrentAssignments(assignments);
        setSelectedPersonas(assignedIds);
      }
    } catch (err) {
      setError('Failed to load personas');
      console.error(err);
    }
  };

  const handlePersonaToggle = async (personaId, isChecked) => {
    try {
      const token = localStorage.getItem('token');
      
      if (isChecked) {
        // Assign persona
        const response = await fetch('http://localhost:5001/api/persona-assignments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: selectedUser._id,
            personaId: personaId
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to assign persona');
        }
      } else {
        // Find the assignment to deactivate
        const assignment = currentAssignments.find(
          a => (a.personaId._id || a.personaId) === personaId
        );

        if (assignment) {
          const response = await fetch(
            `http://localhost:5001/api/persona-assignments/${assignment._id}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'inactive' })
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to unassign persona');
          }
        }
      }
      // Update local state
      setSelectedPersonas(prev => 
        isChecked 
          ? [...prev, personaId]
          : prev.filter(id => id !== personaId)
      );

      // Refresh assignments
      await fetchAvailablePersonas();

    } catch (err) {
      console.error('Error toggling persona:', err);
      setError(err.message || 'Failed to update assignment');
    }
  };

  const handleScenarioToggle = async (scenarioId, isChecked) => {
    try {
      const token = localStorage.getItem('token');
      
      if (isChecked) {
        // Assign scenario
        const response = await fetch('http://localhost:5001/api/scenario-assignments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: selectedUser._id,
            scenarioId: scenarioId
          })
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to assign scenario');
        }
      } else {
        // Find the assignment to deactivate
        const assignment = currentAssignments.find(
          a => (a.scenarioId?._id || a.scenarioId) === scenarioId
        );
  
        if (assignment) {
          const response = await fetch(
            `http://localhost:5001/api/scenario-assignments/${assignment._id}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'inactive' })
            }
          );
  
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to unassign scenario');
          }
        }
      }
  
      // Update local state
      setSelectedScenarios(prev => 
        isChecked 
          ? [...prev, scenarioId]
          : prev.filter(id => id !== scenarioId)
      );
  
      // Refresh assignments
      await fetchScenarios();
  
    } catch (err) {
      console.error('Error toggling scenario:', err);
      setError(err.message || 'Failed to update assignment');
    }
  };

  const renderPersonaList = () => (
    <div className="space-y-4">
      {availablePersonas.map(persona => (
        <PersonaCheckbox
          key={persona._id}
          persona={persona}
          isAssigned={selectedPersonas.includes(persona._id)}
          onChange={handlePersonaToggle}
        />
      ))}
    </div>
  );

  const renderScenarioList = () => (
    <div className="space-y-4">
      {scenarios.map(scenario => (
        <ScenarioCheckbox
          key={scenario._id}
          scenario={scenario}
          isAssigned={selectedScenarios.includes(scenario._id)}
          onToggle={handleScenarioToggle}
        />
      ))}
    </div>
  );

  const handleAssign = async () => {
    if (!selectedUser) return;
  
    setAssigning(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'personas') {
        // Process personas
        for (const personaId of selectedPersonas) {
          try {
            const response = await fetch('http://localhost:5001/api/persona-assignments', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: selectedUser._id,
                personaId: personaId
              })
            });
  
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to assign persona');
            }
          } catch (err) {
            console.error(`Failed to assign persona ${personaId}:`, err);
          }
        }
      } else {
        // Process scenarios
        for (const scenarioId of selectedScenarios) {
          try {
            const response = await fetch('http://localhost:5001/api/scenario-assignments', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: selectedUser._id,
                scenarioId: scenarioId
              })
            });
  
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to assign scenario');
            }
          } catch (err) {
            console.error(`Failed to assign scenario ${scenarioId}:`, err);
          }
        }
      }
  
      setAssignmentSuccess(true);
      setTimeout(() => {
        setIsAssignModalOpen(false);
        setSelectedPersonas([]);
        setSelectedScenarios([]);
        setAssignmentSuccess(false);
      }, 2000);
  
    } catch (err) {
      console.error('Assignment error:', err);
      setError(err.message || 'Failed to update assignments');
    } finally {
      setAssigning(false);
    }
  };

  const handleModalClose = () => {
    setIsAssignModalOpen(false);
    setSelectedPersonas([]);
    setSelectedScenarios([]);
    setAssignmentSuccess(false);
    setError('');
    setActiveTab('personas');
    setCurrentAssignments([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-sky-400 flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div 
            key={user._id}
            className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-sky-900/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">{user.name}</h3>
                <p className="text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setIsAssignModalOpen(true);
                }}
                className="p-2 bg-sky-900/20 rounded-lg text-sky-400 hover:bg-sky-900/40 transition-colors"
                title="Assign Personas"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="w-4 h-4" />
              <span>Active Trainee</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
  isOpen={isAssignModalOpen}
  onClose={handleModalClose}
  title={`Assign Content to ${selectedUser?.name}`}
>
  <div className="p-6">
    {assignmentSuccess ? (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
        <p className="text-emerald-400 text-lg font-medium">
          Successfully updated assignments!
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('personas')}
            className={`pb-2 px-1 ${
              activeTab === 'personas'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Personas
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('scenarios');
              fetchScenarios();
            }}
            className={`pb-2 px-1 ${
              activeTab === 'scenarios'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Scenarios
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'personas' ? renderPersonaList() : renderScenarioList()}
      </div>
    )}
  </div>
</Modal>
    </div>
  );
};

export default UserManagementView;