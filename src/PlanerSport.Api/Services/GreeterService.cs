// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Api.Services;

using Grpc.Core;

/// <summary>
/// Sample gRPC service.
/// </summary>
/// <param name="logger">The logger instance.</param>
public class GreeterService(ILogger<GreeterService> logger) : Greeter.GreeterBase
{
    /// <inheritdoc/>
    public override Task<HelloReply> SayHello(HelloRequest request, ServerCallContext context)
    {
        logger.LogInformation("The message is received from {Name}", request.Name);

        return Task.FromResult(new HelloReply
        {
            Message = "Hello " + request.Name,
        });
    }
}
