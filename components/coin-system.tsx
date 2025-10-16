// components/coin-system.tsx
// Coin system UI for managing user credits and purchases

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Plus, 
  Minus, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Gift,
  History,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface CoinTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface PricingTier {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  bonus?: number;
  popular?: boolean;
  features: string[];
}

interface CoinSystemProps {
  userId?: string;
  currentCoins?: number;
  onPurchase?: (tier: PricingTier) => void;
  onRedeem?: (code: string) => void;
}

export function CoinSystem({ 
  userId, 
  currentCoins = 0, 
  onPurchase, 
  onRedeem 
}: CoinSystemProps) {
  const [coins, setCoins] = useState(currentCoins);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [loading, setLoading] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      coins: 100,
      price: 5,
      currency: 'USD',
      features: ['Basic astrology readings', '5 detailed analyses', 'Email support'],
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      coins: 300,
      price: 12,
      currency: 'USD',
      bonus: 50,
      popular: true,
      features: ['All starter features', 'Advanced chart analysis', 'Priority support', 'Chart downloads'],
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      coins: 600,
      price: 20,
      currency: 'USD',
      bonus: 150,
      features: ['All popular features', 'Unlimited readings', 'Personal astrologer chat', 'Custom reports'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      coins: 1500,
      price: 40,
      currency: 'USD',
      bonus: 500,
      features: ['All premium features', 'API access', 'White-label options', 'Dedicated support'],
    },
  ];

  // Mock transaction data
  useEffect(() => {
    const mockTransactions: CoinTransaction[] = [
      {
        id: '1',
        type: 'purchase',
        amount: 300,
        description: 'Popular Pack Purchase',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'completed',
      },
      {
        id: '2',
        type: 'usage',
        amount: -50,
        description: 'Astrology Reading',
        timestamp: '2024-01-15T11:00:00Z',
        status: 'completed',
      },
      {
        id: '3',
        type: 'bonus',
        amount: 25,
        description: 'Welcome Bonus',
        timestamp: '2024-01-14T09:00:00Z',
        status: 'completed',
      },
      {
        id: '4',
        type: 'usage',
        amount: -30,
        description: 'Chart Analysis',
        timestamp: '2024-01-14T15:30:00Z',
        status: 'completed',
      },
    ];

    setTransactions(mockTransactions);
  }, [userId]);

  const handlePurchase = async (tier: PricingTier) => {
    setLoading(true);
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: CoinTransaction = {
        id: Date.now().toString(),
        type: 'purchase',
        amount: tier.coins + (tier.bonus || 0),
        description: `${tier.name} Purchase`,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setCoins(prev => prev + newTransaction.amount);
      onPurchase?.(tier);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;

    setLoading(true);
    try {
      // Simulate redeem process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: CoinTransaction = {
        id: Date.now().toString(),
        type: 'bonus',
        amount: 50, // Mock bonus amount
        description: `Redeem Code: ${redeemCode}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setCoins(prev => prev + newTransaction.amount);
      setRedeemCode('');
      onRedeem?.(redeemCode);
    } catch (error) {
      console.error('Redeem failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-4 w-4" />;
      case 'usage':
        return <Minus className="h-4 w-4" />;
      case 'bonus':
        return <Gift className="h-4 w-4" />;
      case 'refund':
        return <Plus className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'bonus':
      case 'refund':
        return 'text-green-600';
      case 'usage':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Coin Balance */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span>{coins.toLocaleString()}</span>
            </h2>
            <p className="text-muted-foreground">Available Coins</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">Purchase Coins</TabsTrigger>
          <TabsTrigger value="redeem">Redeem Code</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        {/* Purchase Coins */}
        <TabsContent value="purchase" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className={`p-6 ${tier.popular ? 'ring-2 ring-primary' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{tier.name}</h3>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">USD</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-medium">
                        {tier.coins.toLocaleString()} Coins
                      </span>
                      {tier.bonus && (
                        <Badge variant="secondary" className="text-xs">
                          +{tier.bonus} Bonus
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(tier)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase Now
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-center p-3 border rounded-lg">
                <CreditCard className="h-6 w-6 mr-2" />
                <span className="text-sm">Credit Card</span>
              </div>
              <div className="flex items-center justify-center p-3 border rounded-lg">
                <Smartphone className="h-6 w-6 mr-2" />
                <span className="text-sm">Khalti</span>
              </div>
              <div className="flex items-center justify-center p-3 border rounded-lg">
                <Banknote className="h-6 w-6 mr-2" />
                <span className="text-sm">eSewa</span>
              </div>
              <div className="flex items-center justify-center p-3 border rounded-lg">
                <Banknote className="h-6 w-6 mr-2" />
                <span className="text-sm">ConnectIPS</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Redeem Code */}
        <TabsContent value="redeem" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <Gift className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Redeem Gift Code</h3>
                <p className="text-muted-foreground">
                  Enter a gift code to receive bonus coins
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="redeemCode">Gift Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="redeemCode"
                    placeholder="Enter your gift code"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={!redeemCode.trim() || loading}
                  >
                    {loading ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      'Redeem'
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How to get gift codes:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Refer friends to earn bonus coins</li>
                  <li>• Participate in special promotions</li>
                  <li>• Follow us on social media for giveaways</li>
                  <li>• Complete surveys and feedback forms</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : transaction.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
