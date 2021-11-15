import pika
import os
from pathlib import Path
from dotenv import load_dotenv
import asyncio
import aio_pika
import json

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

        routing_key = "test_queue"
        result_routing_key = "test_result"

        channel = await connection.channel()    # type: aio_pika.Channel
        new_message = json.dumps({"hello": "mark", "result_routing_key": result_routing_key})
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=new_message.encode()
            ),
            routing_key=routing_key
        )

         # Declaring queue
        queue = await channel.declare_queue(
            result_routing_key,
            auto_delete=True
        )   # type: aio_pika.Queue

        async with queue.iterator() as queue_iter:
            # Cancel consuming after __aexit__
            async for message in queue_iter:
                new_one = json.loads(message.body)
                async with message.process():
                    print(message.body)


                    if queue.name in message.body.decode():
                        break
        
        await queue.delete()



        #await connection.close()