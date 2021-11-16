import asyncio
import aio_pika
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from base.events import RecommendationsEvent
import pickle
import datetime


class AsyncRMQ():

    def __init__(self) -> None:
        ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = Path(os.path.join(ROOT_DIR, '.env'))
        load_dotenv(dotenv_path=dotenv_path)
        self.endpoint = os.getenv('RMQ_HOST')
        self.port = os.getenv('RMQ_PORT')
        self.user = os.getenv('RMQ_USER')
        self.password = os.getenv('RMQ_PASSWORD')
        self.queue_name = "recommendations_queue"


    async def main(self, loop):
        connection = await aio_pika.connect_robust(
            # f"amqp://{self.user}:{self.password}@{self.endpoint}:{self.port}/", loop=loop
            f"amqp://rmq_user:3aZyvgvc5Q2pnQzu@rabbitmq:5672/", loop=loop
        )

        async with connection:

            # Creating channel
            channel = await connection.channel()    # type: aio_pika.Channel

            # Declaring queue
            queue = await channel.declare_queue(
                self.queue_name,
                auto_delete=False
            )   # type: aio_pika.Queue

            async with queue.iterator() as queue_iter:
                # Cancel consuming after __aexit__
                async for message in queue_iter:
                    new_one: RecommendationsEvent = pickle.loads(message.body)
                    async with message.process():
                        print(new_one.timestamp)
                        await asyncio.sleep(5)
                        new_one.timestamp = datetime.datetime.now()
                        await channel.default_exchange.publish(
                            aio_pika.Message(
                                body=new_one.serialize()
                            ),
                            routing_key=new_one.result_routing_key
                        )


if __name__ == "__main__":
    app = AsyncRMQ()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(app.main(loop))
    loop.close()