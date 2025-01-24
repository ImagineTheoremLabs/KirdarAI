// src/components/features/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Activity, 
  Target, 
  Award, 
  Clock,
  Users,
  BarChart,
  TrendingUp,
  Calendar,
  Book
} from 'lucide-react';
import ScenarioCard from '../ScenarioChallenge/ScenarioCard';
import ClientCard from '../ClientPersonas/ClientCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    scenariosCompleted: 0,
    practiceHours: 0,
    averageScore: 0,
    progressLevel: 'Beginner',
    totalActivities: 0,
    weeklyProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Fetching data with token:', token ? 'Token exists' : 'No token');

        // Fetch activities
        const activityResponse = await fetch('http://localhost:5001/api/user/activity', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const scenariosResponse = await fetch('http://localhost:5001/api/scenarios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const personasResponse = await fetch('http://localhost:5001/api/personas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const activityData = await activityResponse.json();
        const scenariosData = await scenariosResponse.json();
        const personasData = await personasResponse.json();

        setActivities(activityData.activities || []);
        setStats(activityData.stats || {
          scenariosCompleted: 0,
          practiceHours: 0,
          averageScore: 0,
          progressLevel: 'Beginner',
          totalActivities: 0,
          weeklyProgress: 0
        });
        setScenarios(scenariosData || []);
        setPersonas(personasData || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const RecentActivity = ({ activity }) => (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-sky-900/50 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-800/50 rounded-lg">
          {activity.type === 'scenario_complete' ? (
            <Target className="w-5 h-5 text-sky-400" />
          ) : activity.type === 'assessment_complete' ? (
            <Award className="w-5 h-5 text-sky-400" />
          ) : (
            <Activity className="w-5 h-5 text-sky-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">{activity.title}</h3>
          <p className="text-gray-400 text-sm">{activity.description}</p>
          <div className="flex items-center gap-4 text-sm mt-2">
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date(activity.date).toLocaleDateString()}
            </span>
            {activity.duration && (
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                {activity.duration} min
              </span>
            )}
            {activity.score !== undefined && (
              <span className="flex items-center gap-1 text-sky-400">
                <Award className="w-4 h-4" />
                {activity.score}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-400 mt-2">
              Here's an overview of your progress and available simulations
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            label="Completed Scenarios"
            value={stats.scenariosCompleted}
            change={stats.weeklyProgress}
          />
          <StatCard
            icon={Clock}
            label="Practice Hours"
            value={stats.practiceHours}
          />
          <StatCard
            icon={Award}
            label="Average Score"
            value={`${stats.averageScore}%`}
          />
          <StatCard
            icon={BarChart}
            label="Progress Level"
            value={stats.progressLevel}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-sky-400 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <RecentActivity key={activity._id || index} activity={activity} />
            ))}
            {activities.length === 0 && (
              <p className="text-center text-gray-400 py-4">
                No recent activities found. Start a scenario to begin tracking your progress!
              </p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'scenarios'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => setActiveTab('personas')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'personas'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Client Personas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'scenarios' ? (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-sky-400 flex items-center gap-2">
                <Book className="w-6 h-6" />
                Available Scenarios
              </h2>
            </div>

            {scenarios.length === 0 ? (
              <div className="bg-gray-900/50 rounded-xl p-8 text-center">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No Scenarios Available Yet
                </h3>
                <p className="text-gray-500">
                  Your advisor hasn't assigned any scenarios to you yet. 
                  Check back later or contact your advisor for access to practice scenarios.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario) => (
                  <ScenarioCard key={scenario._id} scenario={scenario} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-sky-400 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Client Personas
              </h2>
            </div>

            {personas.length === 0 ? (
              <div className="bg-gray-900/50 rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No Client Personas Available Yet
                </h3>
                <p className="text-gray-500">
                  Your advisor hasn't assigned any client personas to you yet. 
                  Check back later or contact your advisor to access practice personas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map((persona) => (
                  <ClientCard 
                    key={persona._id} 
                    persona={persona} 
                    onEdit={null}
                    onDelete={null}
                    isAdmin={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, change }) => (
  <div className="relative overflow-hidden bg-gray-900/50 p-6 rounded-2xl border border-sky-500/10 backdrop-blur-sm hover:border-sky-500/30 transition-all duration-500 transform hover:-translate-y-1">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-blue-500/20 animate-pulse-slow" 
           style={{ transform: 'skewY(-20deg)' }} />
    </div>

    <div className="relative flex items-center gap-4">
      <div className="p-3 bg-sky-500/10 rounded-xl backdrop-blur-sm group-hover:bg-sky-500/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-sky-400" />
      </div>
      <div>
        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          {value}
        </div>
        <div className="text-gray-400 text-sm mt-1">{label}</div>
      </div>
    </div>
    
    {change !== undefined && (
      <div className={`mt-2 text-sm flex items-center gap-1 ${
        change >= 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        <TrendingUp className={`w-4 h-4 ${change < 0 && 'transform rotate-180'}`} />
        <span>{Math.abs(change)}% from last period</span>
      </div>
    )}
  </div>
);

export default Dashboard;