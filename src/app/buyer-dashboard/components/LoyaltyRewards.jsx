import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function LoyaltyRewards({ rewardsData }) {
  return (
    <div className="bg-gradient-to-br from-accent to-accent/80 rounded-lg p-6 text-accent-foreground">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold">
          Loyalty Rewards
        </h2>
        <Icon name="GiftIcon" size={24} />
      </div>
      <div className="mb-6">
        <p className="text-sm opacity-90 mb-2">Available Points</p>
        <p className="text-4xl font-bold mb-1">{rewardsData?.points}</p>
        <p className="text-sm opacity-80">
          Worth TZS {rewardsData?.value?.toLocaleString()}
        </p>
      </div>
      <div className="space-y-3 mb-6">
        <div className="bg-accent-foreground/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Next Reward</span>
            <span className="text-sm font-bold">{rewardsData?.nextReward?.points} pts</span>
          </div>
          <div className="w-full bg-accent-foreground/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-accent-foreground h-full transition-all duration-300"
              style={{ width: `${rewardsData?.nextReward?.progress}%` }}
            />
          </div>
          <p className="text-xs opacity-80 mt-2">
            {rewardsData?.nextReward?.remaining} points to go
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold mb-3">Available Offers</h3>
        {rewardsData?.offers?.map((offer) => (
          <div key={offer?.id} className="bg-accent-foreground/10 rounded-lg p-3 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">{offer?.title}</p>
              <p className="text-xs opacity-80">{offer?.description}</p>
            </div>
            <Link 
              href={offer?.link}
              className="px-3 py-1.5 bg-accent-foreground text-accent rounded-md text-xs font-medium hover:opacity-90 transition-opacity duration-200 whitespace-nowrap ml-3"
            >
              Redeem
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

LoyaltyRewards.propTypes = {
  rewardsData: PropTypes?.shape({
    points: PropTypes?.number?.isRequired,
    value: PropTypes?.number?.isRequired,
    nextReward: PropTypes?.shape({
      points: PropTypes?.number?.isRequired,
      progress: PropTypes?.number?.isRequired,
      remaining: PropTypes?.number?.isRequired
    })?.isRequired,
    offers: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        link: PropTypes?.string?.isRequired
      })
    )?.isRequired
  })?.isRequired
};