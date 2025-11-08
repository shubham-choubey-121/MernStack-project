// AI feature disabled: stubbed controller to avoid startup errors when OpenAI is not configured.
const summarizeText = async (req, res) => {
  return res.status(501).json({ message: 'AI summarization disabled on this server' });
};

module.exports = { summarizeText };