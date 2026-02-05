---
name: k8s-debug
description: Kubernetes debugging commands and troubleshooting for the K3s cluster
---

# 🔧 Kubernetes Debugging

This skill provides debugging commands and troubleshooting guides for the K3s cluster on AWS.

## Cluster Overview

| Component | Details |
|-----------|---------|
| Cloud | AWS (Tel Aviv region) |
| Instance | EC2 t3.small |
| Kubernetes | K3s |
| Ingress | NGINX Ingress Controller |
| TLS | cert-manager + Let's Encrypt |
| GitOps | ArgoCD |

## Quick Status Commands

### Check All Resources
```bash
kubectl get all
```

### Check Pods
```bash
# All pods
kubectl get pods

# With more details
kubectl get pods -o wide

# Watch for changes
kubectl get pods -w
```

### Check Specific App Pods
```bash
kubectl get pods -l app=barak-web           # Frontend
kubectl get pods -l app=barak-web-backend   # Backend
kubectl get pods -l app=barak-web-db        # Database
```

## Common Debugging Commands

### View Pod Logs
```bash
# Frontend logs
kubectl logs -l app=barak-web

# Backend logs
kubectl logs -l app=barak-web-backend

# Follow logs in real-time
kubectl logs -f -l app=barak-web-backend

# Last 100 lines
kubectl logs -l app=barak-web --tail=100
```

### Describe Pod (for errors)
```bash
kubectl describe pod <pod-name>

# Example
kubectl describe pod barak-web-backend-xxx-xxx
```

### Check Services
```bash
kubectl get svc

# Expected:
# barak-web-service         ClusterIP   80/TCP
# barak-web-backend-service ClusterIP   80/TCP
# barak-web-db-service      ClusterIP   5432/TCP
```

### Check Ingress
```bash
kubectl get ingress

# Detailed
kubectl describe ingress barak-web-ingress
```

### Check Secrets
```bash
kubectl get secrets

# View secret (base64 encoded)
kubectl get secret barak-web-secrets -o yaml
```

## Troubleshooting Scenarios

### 1. Pods Not Starting (CrashLoopBackOff)

```bash
# Check pod status
kubectl get pods

# If CrashLoopBackOff, check logs
kubectl logs <pod-name>

# Check events
kubectl describe pod <pod-name>
```

**Common Causes:**
- Missing secrets
- Database connection failed
- Image pull error

### 2. 502 Bad Gateway

```bash
# Check if pods are running
kubectl get pods

# Check ingress backend
kubectl describe ingress barak-web-ingress

# Check service endpoints
kubectl get endpoints
```

**Common Causes:**
- Pod not ready
- Service selector mismatch
- Health check failing

### 3. Database Connection Issues

```bash
# Check DB pod
kubectl get pods -l app=barak-web-db

# Check DB logs
kubectl logs -l app=barak-web-db

# Test connection from backend
kubectl exec -it <backend-pod> -- sh
> nc -zv barak-web-db-service 5432
```

### 4. TLS/Certificate Issues

```bash
# Check certificate
kubectl get certificate

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager

# Check secret
kubectl get secret barak-web-tls
```

### 5. ArgoCD Sync Issues

```bash
# Check ArgoCD app status
argocd app get barak-web

# Force sync
argocd app sync barak-web

# Check sync status
argocd app list
```

## Useful One-Liners

```bash
# Restart deployment (trigger rollout)
kubectl rollout restart deployment/barak-web
kubectl rollout restart deployment/barak-web-backend

# Check rollout status
kubectl rollout status deployment/barak-web

# Scale deployment
kubectl scale deployment/barak-web --replicas=2

# Execute shell in pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward for local testing
kubectl port-forward svc/barak-web-service 8080:80
kubectl port-forward svc/barak-web-backend-service 3000:80

# Get pod resource usage
kubectl top pods
```

## Check Resource Limits

```bash
# Current usage
kubectl top pods

# Configured limits (from app.yaml)
# Frontend: 64Mi-128Mi, 250m-500m CPU
# Backend: No limits configured (should add!)
# Database: No limits configured
```

## SSH to EC2 (If Needed)

```bash
ssh -i <key.pem> ec2-user@<ec2-public-ip>

# Then use kubectl as normal
kubectl get pods
```

## Quick Health Check Checklist

- [ ] All pods are Running (not CrashLoopBackOff or Pending)
- [ ] Services have endpoints
- [ ] Ingress has ADDRESS assigned
- [ ] TLS certificate is valid
- [ ] ArgoCD shows Synced status
- [ ] Website loads at https://dogs.barakaloni.com
- [ ] Admin dashboard loads at /admin
