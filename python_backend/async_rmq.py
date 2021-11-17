import asyncio
import aio_pika
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from base.events import RecommendationsEvent
from base.rabbitmq_client import RabbitMqClient


class AsyncRMQ():

    def __init__(self, rabbitmq_client: RabbitMqClient) -> None:
        self.rabbitmq_client = rabbitmq_client


    async def consume_reccs_events(self):
        
        while True:
            
            try:
                routing_key = RecommendationsEvent.routing_key()
                events_queue = await self.rabbitmq_client.declare_queue(routing_key=routing_key,
                                                                        durable=True,
                                                                        auto_delete=False)
                
                mq_consumer = self.rabbitmq_client.consume(queue=events_queue)
                async for event in mq_consumer:
                    recommendations_event: RecommendationsEvent = event
                    print(f"Consumer RecommendationsEvents from RMQ")
                    print("DO SOME PROCESSING.....")
                    print(recommendations_event.test_attribute)
                    await asyncio.sleep(5)
                    recommendations_event.test_attribute = "Hello from RMQ..."
                    exception = await self.rabbitmq_client.publish(message=recommendations_event, 
                                                                   routing_key=recommendations_event.result_routing_key)
                    if exception:
                        print(f"Error {exception} when attempting to send recommendations event back")
                    else:
                        print(f"Published RecommendationsEvent back to it's source")
                    
            except Exception as error:
                print(f"Failure seen attempting to consume RecommendationEvents: {error}. Sleeping for 30 seconds")
                await asyncio.sleep(30)
                
def main():
    app = AsyncRMQ(rabbitmq_client=RabbitMqClient())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(asyncio.gather(app.consume_reccs_events()))
    loop.close()
            
                


if __name__ == "__main__":
    main()