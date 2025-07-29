# custom_turn_detector.py
from livekit.plugins.turn_detector.multilingual import MultilingualModel

class CustomTurnDetector(MultilingualModel):
    def __init__(self):
        super().__init__()

    async def predict_end_of_turn(self, chat_ctx, timeout=2.5):  # Override default timeout here
        return await super().predict_end_of_turn(chat_ctx, timeout=timeout)
