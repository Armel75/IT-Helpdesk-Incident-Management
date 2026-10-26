# Mode Opératoire : Déploiement Local Intégral sous Conteneurs Docker

Ce guide vous explique pas à pas comment déployer et exécuter **l'intégralité** du projet **ResolveIT Helpdesk** sur votre ordinateur en local.

> 💡 **Règle Zéro-Installation :**  
> **Vous n'avez pas besoin d'installer Java, Maven, Node.js ou PostgreSQL sur votre machine hôte.**  
> Tout s'exécute à 100% dans des conteneurs isolés via **Docker** et **Docker Compose**.

---

## 1. Architecture des Conteneurs en Local

Le fichier `compose.yaml` démarre et interconnecte automatiquement 3 conteneurs sur un réseau privé virtuel (`helpdesk-net`) :

| Conteneur | Image / Technologie | Port Hôte | Rôle dans l'application |
|---|---|---|---|
| **`resolveit-postgres-dev`** | PostgreSQL 16 Alpine | `5432` | Base de données relationnelle persistante (volume `pg_data_dev`) avec vérification de santé `pg_isready`. |
| **`resolveit-backend-dev`** | Spring Boot 3.4 / Java 21 LTS | `8080` | API REST, moteur de sécurité JWT rotatif, machine à états des tickets, calcul SLA et migrations Flyway automatiques. |
| **`resolveit-frontend-dev`** | React 19 / TypeScript / Nginx | `3000` | Application Web monopage (SPA) avec reverse proxy Nginx redirigeant `/api/v1/` vers le backend. |

---

## 2. Prérequis sur votre Machine

1. **Docker Desktop** (version 24 ou supérieure) **OU** **Docker Engine** avec le plugin **Docker Compose v2** (`docker compose version`).
2. Un terminal (Bash, Zsh ou PowerShell sous Windows/WSL2).
3. L'outil `make` (fourni nativement sur Linux/macOS, ou optionnel en utilisant directement les commandes `docker compose`).

---

## 3. Guide de Démarrage Rapide (3 Commandes)

Ouvrez votre terminal dans le répertoire racine du projet :

### Étape 1 : Créer le fichier d'environnement
Copiez le modèle d'environnement `.env.example` vers `.env` :
```bash
cp .env.example .env
```
*(Le fichier est pré-configuré avec des identifiants et clés de sécurité valides pour le développement local).*

### Étape 2 : Lancer la construction et le démarrage de tous les conteneurs
```bash
# Avec Make :
make up

# Ou avec la commande Docker Compose directe :
docker compose up -d --build
```

> **Ce qui se passe automatiquement en coulisses :**
> 1. PostgreSQL 16 démarre et s'initialise.
> 2. Le backend compile dans son conteneur builder Maven/Java 21, attend que PostgreSQL soit prêt (`healthy`), puis exécute les migrations Flyway pour créer les tables et injecter les données de démonstration.
> 3. Le frontend compile ses modules React/TypeScript sous Vite et démarre son serveur Nginx.

### Étape 3 : Vérifier l'état de santé des services
```bash
docker compose ps
```
Les 3 conteneurs doivent afficher le statut **`Up (healthy)`** :
```
NAME                     STATUS                   PORTS
resolveit-postgres-dev   Up (healthy)             0.0.0.0:5432->5432/tcp
resolveit-backend-dev    Up (healthy)             0.0.0.0:8080->8080/tcp
resolveit-frontend-dev   Up (healthy)             0.0.0.0:3000->8080/tcp
```

---

## 4. Accès aux Services et Interfaces

Une fois les conteneurs démarrés, ouvrez votre navigateur :

* 🌐 **Application Web (Frontend React)** : [http://localhost:3000](http://localhost:3000)
* ⚙️ **API REST Backend** : [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
* 📖 **Documentation Interactive OpenAPI / Swagger UI** : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* 🩺 **Sonde de santé Actuator** : [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 5. Comptes de Test Pré-configurés (Données Flyway V2)

Le mot de passe pour tous les comptes de test est : **`Password123!`**

| Rôle | Email | Périmètre d'autorisation (RBAC) |
|---|---|---|
| **Administrateur** | `admin@resolveit.internal` | Provisioning des utilisateurs, activation/désactivation, audit logs de sécurité. |
| **IT Manager** | `manager.sarah@resolveit.internal` | Supervision globale des files, réassignations, métriques de conformité SLA. |
| **IT Agent (Senior)** | `agent.marcus@resolveit.internal` | Triage, prise en charge, notes internes confidentielles, résolutions. |
| **IT Agent (Desk)** | `agent.elena@resolveit.internal` | Triage de premier niveau, commentaires publics, clôture. |
| **Employé** | `employee.alex@resolveit.internal` | Portail self-service, création de tickets, consultation restreinte à ses propres tickets (protection IDOR). |
| **Employée** | `employee.chloe@resolveit.internal` | Portail self-service, consultation de ses équipements informatiques assignés. |

> 💡 *Astuce dans l'interface Web : Vous pouvez basculer instantanément de rôle grâce au menu déroulant en haut à droite pour tester les permissions et le cloisonnement des données.*

---

## 6. Commandes d'Exploitation et Maintenance

Toutes les actions courantes peuvent être exécutées via le `Makefile` ou les scripts du dossier `scripts/` :

```bash
# Voir les logs en direct de tous les conteneurs
make logs
# ou: docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f postgres

# Arrêter tous les conteneurs proprement
make down
# ou: docker compose down

# Reconstruire les images après une modification du code
make build && make up

# Créer une sauvegarde compressée (.sql.gz) de la base de données PostgreSQL
make db-backup

# Restaurer la base de données depuis la dernière sauvegarde
make db-restore

# Remise à zéro complète (suppression des conteneurs et des volumes de données)
docker compose down -v
```

---

## 7. Résolution des Problèmes Fréquents (Troubleshooting)

### Port déjà utilisé (Ex: 3000, 8080 ou 5432)
Si vous avez déjà un serveur local ou un PostgreSQL d'installé qui écoute sur l'un de ces ports :
* Modifiez le mappage des ports hôtes dans le fichier `.env` ou dans `compose.yaml` (par exemple `"3001:8080"` pour le frontend ou `"5433:5432"` pour Postgres).

### Le conteneur backend attend PostgreSQL
Le backend attend que la sonde de santé (`pg_isready`) de PostgreSQL réponde avec succès avant de démarrer. Si l'attente se prolonge, vérifiez les logs de la base de données avec `docker compose logs postgres`.

### Problème de mémoire lors du build initial
Le premier build télécharge les couches Docker et les dépendances Maven/npm. Sur Docker Desktop, assurez-vous d'avoir alloué au moins 4 Go de mémoire RAM (*Settings > Resources > Memory*).
