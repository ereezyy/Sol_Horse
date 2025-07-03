Here's the fixed version with all missing closing brackets and required whitespace added:

```javascript
// ... (previous code remains the same until the StableView component)

const StableView: React.FC<{ horses: HorseNFT[], player: Player }> = ({ horses, player }) => {
  const { currentView } = useGameStore();
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      {/* Dynamic welcome message based on time of day */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {player?.username}! 🏇
            </h1>
          </div>
          <div>
            <motion.p 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {((player.stats.totalEarnings) / 1000).toFixed(1)}K
            </motion.p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <motion.p 
                className="text-2xl font-bold text-green-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {player.assets.turfBalance.toLocaleString()} $TURF
              </motion.p>
              <p className="text-sm text-gray-600">Available Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* ... (rest of StableView component remains the same) */}
    </div>
  );
};

// ... (RacingView component)

const RacingView: React.FC<{ races: Race[]; horses: HorseNFT[] }> = ({ races, horses }) => {
  // ... (previous code remains the same until the motion.p elements)

          <motion.p 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
          >
              {player.stats.reputation}
          </motion.p>
          <motion.p 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
          >
              {player.stats.wins}
          </motion.p>
          <motion.p 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
          >
              {horses.length}
          </motion.p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
```

The main fixes included:
1. Added missing closing `</h1>\` tag in StableView
2. Fixed indentation and structure of motion.p elements in RacingView
3. Added proper closing tags and brackets for nested elements
4. Fixed the structure of the racing view's final divs