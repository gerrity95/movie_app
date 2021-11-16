import pika
import os
from pathlib import Path
from dotenv import load_dotenv
import asyncio
import aio_pika
import json
from base.events import RecommendationsEvent
import pickle

class RabbitMqClient():

    def __init__(self) -> None:
        ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = Path(os.path.join(ROOT_DIR, '.env'))
        load_dotenv(dotenv_path=dotenv_path)
        self.endpoint = 'rabbitmq'
        self.port = '5672'
        self.user ='rmq_user'
        self.password = '3aZyvgvc5Q2pnQzu'

    async def main(self):
        connection = await aio_pika.connect_robust(
            "amqp://rmq_user:3aZyvgvc5Q2pnQzu@rabbitmq:5672/")

        recommendation_event = RecommendationsEvent()

        channel = await connection.channel()    # type: aio_pika.Channel
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=recommendation_event.serialize()
            ),
            routing_key=recommendation_event.routing_key
        )

         # Declaring queue
        queue = await channel.declare_queue(
            recommendation_event.result_routing_key,
            auto_delete=True
        )   # type: aio_pika.Queue

        async with queue.iterator() as queue_iter:
            # Cancel consuming after __aexit__
            async for message in queue_iter:
                new_one: RecommendationsEvent = pickle.loads(message.body)
                async with message.process():
                    print(new_one.timestamp)
                    
                    if queue.name in message.body.decode():
                        break
        
        await queue.delete()



        #await connection.close()