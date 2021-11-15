import asyncio
import aio_pika
import json
import os
from pathlib import Path
from dotenv import load_dotenv

class RabbitMqClient():

    def __init__(self) -> None:
        ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = Path(os.path.join(ROOT_DIR, '.env'))
        load_dotenv(dotenv_path=dotenv_path)
        self.endpoint = 'rabbitmq'
        self.port = '5672'
        self.user ='rmq_user'
        self.password = '3aZyvgvc5Q2pnQzu'


    async def main(self, loop):
        connection = await aio_pika.connect_robust(
            f"amqp://{self.user}:{self.password}@{self.endpoint}:{self.port}/", loop=loop
        )

        async with connection:
            queue_name = "test_queue"

            # Creating channel
            channel = await connection.channel()    # type: aio_pika.Channel

            # Declaring queue
            queue = await channel.declare_queue(
                queue_name,
                auto_delete=False
            )   # type: aio_pika.Queue

            async with queue.iterator() as queue_iter:
                # Cancel consuming after __aexit__
                async for message in queue_iter:
                    new_one = json.loads(message.body)
                    async with message.process():
                        print(new_one['hello'])
                        new_one['hello'] = "Grainne"
                        await asyncio.sleep(5)
                        new_formatted = json.dumps(new_one)
                        await channel.default_exchange.publish(
                            aio_pika.Message(
                                body=new_formatted.encode()
                            ),
                            routing_key=new_one['result_routing_key']
                        )


                        if queue.name in message.body.decode():
                            break


if __name__ == "__main__":
    app = RabbitMqClient()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(app.main(loop))
    loop.close()