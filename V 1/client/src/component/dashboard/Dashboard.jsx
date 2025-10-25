import MyOffers from './MyOffers';
import ActivityFeed from './ActivityFeed';

export default function Dashboard({ myOffers, activeMissions, notifications, receivedApplications, loading, onTabChange }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mes annonces */}
      <MyOffers 
        myOffers={myOffers}
        loading={loading}
        onTabChange={onTabChange}
      />

      {/* Activité récente */}
      <ActivityFeed notifications={notifications} />
    </div>
  );
}
