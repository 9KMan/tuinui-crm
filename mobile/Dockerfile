# Flutter Mobile App Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build dependencies
FROM ubuntu:jammy AS build_deps

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download and install Flutter SDK
RUN wget -q https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz
RUN tar xf flutter_linux_3.24.0-stable.tar.xz -C /opt
RUN rm flutter_linux_3.24.0-stable.tar.xz

# Set Flutter path
ENV PATH="/opt/flutter/bin:${PATH}"

# Stage 2: Build the app
FROM build_deps AS builder

WORKDIR /app

# Copy pubspec.yaml and dependencies
COPY pubspec.yaml .

# Install Flutter dependencies
RUN flutter pub get

# Copy the rest of the app
COPY lib/ ./lib/
COPY test/ ./test/

# Generate code (for json_serializable, freezed, etc.)
# RUN flutter pub run build_runner build --delete-conflicting-outputs

# Build the debug APK for testing
RUN flutter build apk --debug

# Stage 3: Create release build
FROM build_deps AS releaser

WORKDIR /app

# Copy the built app from builder
COPY --from=builder /app/build/app/outputs/flutter-apk/app-debug.apk /app/app-debug.apk

# Also build release APK
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/pubspec.yaml ./pubspec.yaml
COPY --from=builder /app/.dart_tool ./.dart_tool
COPY --from=builder /app/.packages ./.packages

# Build release APK
ENV PATH="/opt/flutter/bin:${PATH}"
RUN flutter pub get
RUN flutter build apk --release

# Stage 4: Final minimal image with just APKs
FROM alpine:latest AS final

WORKDIR /app

# Copy APKs from releaser
COPY --from=releaser /app/app-debug.apk /app/app-debug.apk
COPY --from=releaser /app/build/app/outputs/flutter-apk/app-release.apk /app/app-release.apk

# Default command - show available APKs
CMD ["sh"]
