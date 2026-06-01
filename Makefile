init:
	docker build -t api:1.0 .\app\api
	docker build -t frontend:1.0 .\app\frontend
	docker build -t worker:1.0 .\app\worker

	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

	kubectl apply -k .\k8s\overlays\dev\
	
	kubectl apply -k .\k8s\overlays\prod\

# 	kubectl apply -f k8s -R

# 	kubectl rollout restart deployment/api -n ticket-app
# 	kubectl rollout restart deployment/frontend -n ticket-app
# 	kubectl rollout restart deployment/worker -n ticket-app

reset:
	kubectl delete all --all -n ticket-app
	kubectl delete pvc --all -n ticket-app
	kubectl delete namespace ticket-app-dev
	kubectl delete namespace ticket-app-prod

forward-api:
	kubectl port-forward service/api 8080:8080  

forward-frontend:
	kubectl port-forward service/frontend 80:80  

# pods:
# 	kubectl get pods -n ticket-app

services:
	kubectl get services -n ticket-app

network:
	kubectl get networkpolicy -n ticket-app

pvc:
	kubectl get pvc -n ticket-app

pdb:
	kubectl get poddisruptionbudgets -n ticket-app

run-dev:
	 kubectl apply -k .\k8s\overlays\dev\

run-prod:
	kubectl apply -k .\k8s\overlays\prod\

pods:
	kubectl get pods -n ticket-app-dev
	kubectl get pods -n ticket-app-prod

patch-secret:
	kubectl create secret generic worker-secret-prod --from-literal=EMAIL_ADDRESS=mt8qtp@gmail.com --from-literal=EMAIL_PASSWORD=fpxwcrrtuviiavdx -n ticket-app-prod --dry-run=client -o yaml | kubectl apply -f -
	kubectl rollout restart deployment/worker-prod -n ticket-app-prod     