/**
 * The network matters more than it looks: a testnet anchor is not evidence
 * that a pubnet integration works, and the two are easy to confuse at a
 * glance in a table.
 */
export function NetworkTag({ network }: { network: string }) {
  const isTestnet = network === 'testnet';
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
        isTestnet ? 'bg-violet-400/15 text-violet-300' : 'bg-sky-400/15 text-sky-300'
      }`}
      title={isTestnet ? 'A test network anchor: no real funds are involved.' : 'Stellar pubnet.'}
    >
      {network}
    </span>
  );
}
