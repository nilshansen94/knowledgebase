FROM nginx:alpine

COPY dist/knowledgebase /usr/share/nginx/html

COPY docker/knowledgebase/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
