FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -o /app/server cmd/api/main.go

FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Jakarta

COPY --from=builder /app/server /app/server

EXPOSE 8080

CMD ["/app/server"]
