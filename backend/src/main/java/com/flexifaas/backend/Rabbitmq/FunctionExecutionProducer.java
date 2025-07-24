package com.flexifaas.backend.Rabbitmq;

import com.flexifaas.backend.DTO.FunctionExecutionRequest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FunctionExecutionProducer {

    private final RabbitTemplate rabbitTemplate;
    private final String functionExecutionQueue;

    public FunctionExecutionProducer(
            RabbitTemplate rabbitTemplate,
            @Value("${rabbitmq.queue.name:function-execution-queue}") String functionExecutionQueue
    ) {
        this.rabbitTemplate = rabbitTemplate;
        this.functionExecutionQueue = functionExecutionQueue;
    }

    public void sendExecutionRequest(FunctionExecutionRequest request) {
        rabbitTemplate.convertAndSend(functionExecutionQueue, request);
    }
}
