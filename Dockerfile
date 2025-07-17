FROM oven/bun:latest AS builder

WORKDIR /app

# Copy the entire repo to the docker image
COPY / ./

# Install dependencies (including workspace deps)
RUN bun install --frozen-lockfile

RUN bun build ./container_src/index.ts --compile --minify --outfile container.bun

FROM ubuntu

RUN apt-get update && apt-get install -y git
COPY --from=builder /app/container.bun /container.bun

EXPOSE 8080

CMD ["/container.bun"]