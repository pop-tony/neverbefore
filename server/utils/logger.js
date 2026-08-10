const formatContext = (context = {}) => {
  if (!context || typeof context !== 'object') return '';

  const entries = Object.entries(context).filter(([, value]) => value !== undefined);
  if (!entries.length) return '';

  return ` ${entries
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}=${value}`;
      return `${key}=${JSON.stringify(value)}`;
    })
    .join(' ')}`;
};

export const logInfo = (message, context = {}) => {
  console.log(`[${new Date().toISOString()}] ${message}${formatContext(context)}`);
};

export const logError = (message, error, context = {}) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${new Date().toISOString()}] ${message}${formatContext(context)}`);
  console.error(`  error=${errorMessage}`);

  if (stack && process.env.NODE_ENV !== 'production') {
    console.error(stack);
  }
};
