import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Target, 
  AlertCircle, 
  BookOpen,
  Activity,
  ArrowRight,
  UserPlus, 
  Loader, 
  CheckCircle2,
  Edit,
  Trash2
} from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import { useState } from 'react';

const ClientCard = ({ persona, onEdit, onDelete, isAdmin }) => {
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState('');
  const [trainees, setTrainees] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  const handleStartSimulation = () => {
    console.log('Starting simulation with persona:', persona);
    
    navigate('/simulation', {
      state: {
        type: 'persona',
        data: {
          id: persona._id,
          name: persona.name,
          age: persona.age,
          income: persona.income,
          portfolio: persona.portfolio,
          riskTolerance: persona.riskTolerance,
          goals: persona.goals,
          concerns: persona.concerns,
          knowledgeLevel: persona.knowledgeLevel
        }
      },
      replace: false
    });
  };

  const fetchTrainees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/trainees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch trainees');
      }
      
      const data = await response.json();
      setTrainees(data);
    } catch (error) {
      console.error('Error fetching trainees:', error);
      setAssignmentError('Failed to load trainees');
    }
  };
  
  const handleOpenAssignModal = () => {
    setIsAssignModalOpen(true);
    fetchTrainees();
  };
  
  const handleAssignPersona = async () => {
    if (!selectedTrainee) return;
    
    setIsAssigning(true);
    setAssignmentError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/persona-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedTrainee,
          personaId: persona._id
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to assign persona');
      }
  
      setAssignmentSuccess(true);
      setTimeout(() => {
        setIsAssignModalOpen(false);
        setAssignmentSuccess(false);
        setSelectedTrainee('');
      }, 2000);
    } catch (error) {
      console.error('Error assigning persona:', error);
      setAssignmentError(error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!persona) {
    console.log('No persona data provided to ClientCard');
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 hover:border-sky-900/50 
                    transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-sky-400">{persona.name}</h3>
          {isAdmin && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(persona);
                  }}
                  className="text-gray-400 hover:text-sky-400 transition-colors"
                  title="Edit Persona"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(persona);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Persona"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleOpenAssignModal}
                className="text-gray-400 hover:text-emerald-400 transition-colors"
                title="Assign to Trainee"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-300">Income: {persona.income}</p>
              <p className="text-gray-300">Portfolio: {persona.portfolio}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-300">Goals: {persona.goals}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-300">Concerns: {persona.concerns}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-300">Knowledge Level: {persona.knowledgeLevel}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartSimulation}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-2 px-4 
                     rounded-lg font-medium transition-all duration-300 hover:from-sky-500 
                     hover:to-blue-600 flex items-center justify-center gap-2"
        >
          Start Simulation
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedTrainee('');
          setAssignmentError('');
          setAssignmentSuccess(false);
        }}
        title="Assign Persona to Trainee"
      >
        <div className="p-6 space-y-6">
          {assignmentSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
              <p className="text-emerald-400 text-lg font-medium">Successfully assigned persona!</p>
            </div>
          ) : (
            <>
              {assignmentError && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
                  <p className="text-red-400">{assignmentError}</p>
                </div>
              )}

              <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-300 mb-2 block">Select Trainee</span>
                  <select
                    value={selectedTrainee}
                    onChange={(e) => setSelectedTrainee(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">Select a trainee...</option>
                    {trainees.map(trainee => (
                      <option key={trainee._id} value={trainee._id}>
                        {trainee.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={handleAssignPersona}
                  disabled={!selectedTrainee || isAssigning}
                  className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg font-medium transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Assign Persona
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClientCard;
