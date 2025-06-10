# Sample App with Ephemeral Environments

This repository demonstrates how to use ephemeral environments with vcluster and DevSpace for development and testing.

## Features

- 🚀 Automatic ephemeral environment creation for each PR
- 🔄 Live code synchronization with DevSpace
- 🔍 Hot reloading for development
- 🏗️ Isolated environments per PR
- 🧹 Automatic cleanup when PRs are closed
- 🔒 TLS/HTTPS support with Let's Encrypt
- 🛡️ Enhanced security headers and middleware
- 📊 Improved database connection pooling
- 🐛 Advanced debugging capabilities
- 🔄 Robust database initialization
- ⚡ Automated deployment with status checks
- 🛠️ Graceful error handling and cleanup
- 🔐 Flexible container registry configuration

## Prerequisites

- [DevSpace CLI](https://devspace.sh/cli/docs/getting-started/installation)
- [vcluster CLI](https://www.vcluster.com/docs/getting-started/setup)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (for local development)
- Access to container registry (GitHub Container Registry or private registry)

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature
```

### 2. Make Changes and Push

```bash
git add .
git commit -m "Your changes"
git push origin feature/your-feature
```

### 3. Create a Pull Request

When you create a PR, GitHub Actions will automatically:

- Create a new vcluster for your PR
- Build and push container image to configured registry
- Deploy the application
- Configure TLS with Let's Encrypt
- Wait for deployment and ingress to be ready
- Add a comment with environment details
- Clean up on failure

### 4. Local Development

Once the PR is created, you can develop locally :

```bash
# Login to container registry (if using private registry)
docker login $REGISTRY

# Connect to the vcluster
vcluster connect pr-<PR_NUMBER> --namespace qa

# Start development with DevSpace
devspace dev --kube-context pr-<PR_NUMBER> --namespace pr-<PR_NUMBER>
```

This will:

- Sync your local code to the cluster
- Forward ports for development (8080 for app, 9229 for debugging)
- Provide hot reloading
- Give you a development shell
- Enable Node.js debugging
- Show real-time logs with timestamps

## Environment Access

- Development URL: `https://sample-app-<PR_NUMBER>.mghcloud.com`
- Local development: `http://localhost:8080`
- Debug port: `localhost:9229`

## Project Structure

```
sample-app/
├── .github/
│   └── workflows/
│       └── ephemeral-env.yml    # GitHub Actions workflow
├── k8s/
│   ├── deployment.yaml         # Main application deployment
│   ├── postgres.yaml          # Database deployment
│   ├── configmap.yaml         # Application configuration
│   ├── db-init.yaml           # Database initialization
│   └── kustomization.yaml     # Kustomize configuration
├── src/
│   ├── server.js              # Express application
│   ├── public/                # Frontend assets
│   └── db/                    # Database scripts
├── Dockerfile                 # Container definition
├── devspace.yaml             # DevSpace configuration
├── values.yaml               # vcluster configuration
└── package.json              # Node.js dependencies
```

## GitHub Actions Workflow

The workflow in `.github/workflows/ephemeral-env.yml` handles:

1. **Environment Creation**:

   - Creates vcluster with k3s
   - Configures networking and ingress
   - Sets up TLS with Let's Encrypt

2. **Application Deployment**:

   - Builds and pushes container images to configured registry
   - Creates registry secret if using private registry
   - Deploys using DevSpace
   - Waits for deployment and ingress readiness
   - Configures security headers

3. **Error Handling**:

   - Graceful cleanup on failure
   - Timeout settings for long operations
   - Status checks for critical components

4. **Cleanup**:
   - Automatic cleanup when PR is closed
   - Resource cleanup on workflow failure
   - Graceful handling of deletion errors

## Security Features

- TLS/HTTPS with Let's Encrypt
- Security headers middleware
- HSTS configuration
- XSS protection
- Content-Type sniffing protection
- Database connection pooling with proper error handling
- Secure database initialization
- Flexible registry authentication

## Debugging

### Node.js Debugging

1. Start the development environment:

```bash
devspace dev
```

2. Connect your debugger to `localhost:9229`

3. Use the debug console in your IDE or Chrome DevTools

### Database Debugging

1. Check database initialization:

```bash
kubectl logs -n pr-<PR_NUMBER> -l job-name=db-init
```

2. Monitor database connections:

```bash
kubectl logs -n pr-<PR_NUMBER> -l app=sample-app
```

## Troubleshooting

### Common Issues

1. **vcluster connection fails**

   ```bash
   # Check if vcluster is running
   kubectl get pods -n qa

   # Reconnect to vcluster
   vcluster connect pr-<PR_NUMBER> --namespace qa
   ```

2. **DevSpace sync issues**

   ```bash
   # Restart DevSpace
   devspace dev --kube-context pr-<PR_NUMBER> --namespace pr-<PR_NUMBER> --force-restart
   ```

3. **Application not accessible**

   ```bash
   # Check pod status
   kubectl get pods -n pr-<PR_NUMBER>

   # Check logs
   kubectl logs -n pr-<PR_NUMBER> -l app=sample-app

   # Check ingress
   kubectl get ingress -n pr-<PR_NUMBER>
   ```

4. **Database issues**

   ```bash
   # Check database pod
   kubectl get pods -n pr-<PR_NUMBER> -l app=postgres

   # Check database logs
   kubectl logs -n pr-<PR_NUMBER> -l app=postgres

   # Check initialization job
   kubectl get jobs -n pr-<PR_NUMBER>
   kubectl logs -n pr-<PR_NUMBER> -l job-name=db-init
   ```

5. **Registry issues**

   ```bash
   # Check if you can pull the image
   docker pull ${REGISTRY}/${REGISTRY_NAMESPACE}/sample-app:${PR_NUMBER}

   # Check registry secret (if using private registry)
   kubectl get secret docker-registry-secret -n pr-<PR_NUMBER> -o yaml

   # Check pod events for image pull errors
   kubectl describe pod -n pr-<PR_NUMBER> -l app=sample-app
   ```

## Required Secrets

The following secrets need to be configured in your GitHub repository:

- `KUBECONFIG`: Your cluster's kubeconfig
- `GITHUB_TOKEN`: Automatically provided by GitHub
- `CONTAINER_REGISTRY`: (Optional) Container registry URL (defaults to 'ghcr.io')
- `REGISTRY_NAMESPACE`: (Optional) Registry namespace (defaults to repository owner)
- `REGISTRY_USERNAME`: (Optional) Registry username (defaults to GitHub actor)
- `REGISTRY_PASSWORD`: (Optional) Registry password (defaults to GitHub token)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
