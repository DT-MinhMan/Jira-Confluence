# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_FRONTEND_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

RUN pnpm run build

# ---- Stage 2: Serve with nginx ----
FROM nginx:alpine AS runner 
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 1786
CMD ["nginx", "-g", "daemon off;"]
