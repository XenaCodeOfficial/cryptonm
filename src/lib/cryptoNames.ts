// Mapping of crypto symbols to their full names
export const CRYPTO_NAMES: Record<string, string> = {
  // Top cryptocurrencies
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'USDT': 'Tether',
  'BNB': 'Binance Coin',
  'SOL': 'Solana',
  'XRP': 'Ripple',
  'USDC': 'USD Coin',
  'ADA': 'Cardano',
  'DOGE': 'Dogecoin',
  'TRX': 'TRON',
  'TON': 'Toncoin',
  'LINK': 'Chainlink',
  'MATIC': 'Polygon',
  'DOT': 'Polkadot',
  'SHIB': 'Shiba Inu',
  'DAI': 'Dai',
  'AVAX': 'Avalanche',
  'UNI': 'Uniswap',
  'ATOM': 'Cosmos',
  'XLM': 'Stellar',
  'LTC': 'Litecoin',
  'BCH': 'Bitcoin Cash',
  'XMR': 'Monero',
  'ETC': 'Ethereum Classic',
  'APT': 'Aptos',
  'ARB': 'Arbitrum',
  'OP': 'Optimism',
  'IMX': 'Immutable X',
  'NEAR': 'NEAR Protocol',
  'FIL': 'Filecoin',
  'ALGO': 'Algorand',
  'VET': 'VeChain',
  'ICP': 'Internet Computer',
  'HBAR': 'Hedera',
  'STX': 'Stacks',
  'AAVE': 'Aave',
  'MKR': 'Maker',
  'GRT': 'The Graph',
  'SAND': 'The Sandbox',
  'MANA': 'Decentraland',
  'AXS': 'Axie Infinity',
  'FTM': 'Fantom',
  'THETA': 'Theta Network',
  'EOS': 'EOS',
  'EGLD': 'MultiversX',
  'XTZ': 'Tezos',
  'CAKE': 'PancakeSwap',
  'KLAY': 'Klaytn',
  'FLOW': 'Flow',
  'CHZ': 'Chiliz',
  'GALA': 'Gala',
  'ENJ': 'Enjin Coin',
  'ZIL': 'Zilliqa',
  'BAT': 'Basic Attention Token',
  'CRV': 'Curve DAO Token',
  'COMP': 'Compound',
  'YFI': 'yearn.finance',
  'SUSHI': 'SushiSwap',
  '1INCH': '1inch',
  'SNX': 'Synthetix',
  'LRC': 'Loopring',
  'ZRX': '0x',
  'BAL': 'Balancer',
  'KNC': 'Kyber Network',
  'REN': 'Ren',
  'UMA': 'UMA',
  'OCEAN': 'Ocean Protocol',
  'STORJ': 'Storj',

  // Special additions
  'TEL': 'Telcoin',
  'PEPE': 'Pepe',
  'WIF': 'dogwifhat',
  'BONK': 'Bonk',
  'FLOKI': 'Floki Inu',
  'BRETT': 'Brett',
}

/**
 * Get the full name of a cryptocurrency from its symbol
 * @param symbol - The crypto symbol (e.g., 'BTC', 'ETH')
 * @returns The full name (e.g., 'Bitcoin', 'Ethereum') or the symbol if not found
 */
export function getCryptoName(symbol: string): string {
  return CRYPTO_NAMES[symbol.toUpperCase()] || symbol
}

/**
 * Get the formatted display name: "Full Name SYMBOL"
 * @param symbol - The crypto symbol
 * @returns Formatted string like "Bitcoin BTC"
 */
export function getCryptoDisplayName(symbol: string): string {
  const upperSymbol = symbol.toUpperCase()
  const name = CRYPTO_NAMES[upperSymbol]
  return name ? `${name} ${upperSymbol}` : upperSymbol
}
